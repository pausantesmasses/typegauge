require 'rubygems'
require 'capistrano'

require 'rbconfig'
require ::Config::CONFIG['rubylibdir'] + "/../gems/1.8/gems/capistrano-1.2.0/test/scm" + "/../utils"

require 'test/unit'
require 'new_subversion'

class ScmNewSubversionTest < Test::Unit::TestCase
  class NewSubversionTest < Capistrano::SCM::NewSubversion
    attr_accessor :story
    attr_reader   :last_path
    attr_reader :local_cmds, :local_file

    def svn_log(path)
      @last_path = path
      story.shift
    end

    def run_local(cmd)
      @local_cmds ||= []
      @local_cmds << cmd
    end

    def read_local_file(fn)
      @local_file= fn
    end
  end

  class MockChannel
    attr_reader :sent_data

    def send_data(data)
      @sent_data ||= []
      @sent_data << data
    end

    def [](name)
      "value"
    end
  end

  class MockActor
    attr_reader :command
    attr_reader :channels
    attr_accessor :story
    attr_reader :put_infile, :put_outfile

    def initialize(config)
      @config = config
    end

    def run(command)
      @command = command
      @channels ||= []
      @channels << MockChannel.new
      story.each { |stream, line| yield @channels.last, stream, line }
    end

    def method_missing(sym, *args)
      @config.send(sym, *args)
    end

    def put(infile, outfile)
      @put_infile= infile
      @put_outfile= outfile
    end
  end

  def setup
    @config = MockConfiguration.new
    @config[:current_path] = "/mwa/ha/ha/current"
    @config[:repository] = "/hello/world"
    @config[:svn] = "/path/to/svn"
    @config[:password] = "chocolatebrownies"
    @scm = NewSubversionTest.new(@config)
    @actor = MockActor.new(@config)
    @log_msg = <<MSG.strip
------------------------------------------------------------------------
r1967 | minam | 2005-08-03 06:59:03 -0600 (Wed, 03 Aug 2005) | 2 lines

Initial commit of the new capistrano utility

------------------------------------------------------------------------
MSG
    @scm.story = [ @log_msg ]
  end

  def test_latest_revision
    @scm.story = [ @log_msg ]
    assert_equal "1967", @scm.latest_revision
    assert_equal "/hello/world", @scm.last_path
  end

  def test_latest_revision_dif_local_path
    @scm.story = [ @log_msg ]
    @config[:local_repository_path]= "/local/rep/path"
    assert_equal "1967", @scm.latest_revision
    assert_equal "/local/rep/path", @scm.last_path
  end

  def test_checkout
    @actor.story = []
    assert_nothing_raised { @scm.checkout(@actor) }
    assert_nil @actor.channels.last.sent_data
    assert_match %r{/path/to/svn co\s+-q}, @actor.command
  end

  def test_checkout_via_export
    @actor.story = []
    @config[:checkout] = "export"
    assert_nothing_raised { @scm.checkout(@actor) }
    assert_nil @actor.channels.last.sent_data
    assert_match %r{/path/to/svn export\s+-q}, @actor.command
  end

  def test_update
    @actor.story = []
    assert_nothing_raised { @scm.update(@actor) }
    assert_nil @actor.channels.last.sent_data
    assert_match %r{/path/to/svn up}, @actor.command
  end

  def test_update_with_dif_remote_path
    @actor.story = []
    @config[:remote_svn] = "/remote/svn/path"
    assert_nothing_raised { @scm.update(@actor) }
    assert_nil @actor.channels.last.sent_data
    assert_match %r{/remote/svn/path up}, @actor.command
  end

  def test_checkout_needs_ssh_password
    @actor.story = [[:out, "Password: "]]
    assert_nothing_raised { @scm.checkout(@actor) }
    assert_equal ["chocolatebrownies\n"], @actor.channels.last.sent_data
  end

  def test_checkout_needs_http_password
    @actor.story = [[:out, "Password for (something): "]]
    assert_nothing_raised { @scm.checkout(@actor) }
    assert_equal ["chocolatebrownies\n"], @actor.channels.last.sent_data
  end

  def test_checkout_needs_https_certificate
    @actor.story = [[:out, "(R)eject, accept (t)emporarily or accept (p)ermanently? "]]
    assert_nothing_raised { @scm.checkout(@actor) }
    assert_equal ["t\n"], @actor.channels.last.sent_data
  end

  def test_checkout_needs_alternative_ssh_password
    @actor.story = [[:out, "someone's password: "]]
    assert_nothing_raised { @scm.checkout(@actor) }
    assert_equal ["chocolatebrownies\n"], @actor.channels.last.sent_data
  end

  def test_svn_password
    @config[:svn_password] = "butterscotchcandies"
    @actor.story = [[:out, "Password: "]]
    assert_nothing_raised { @scm.checkout(@actor) }
    assert_equal ["butterscotchcandies\n"], @actor.channels.last.sent_data
  end

  def test_svn_username
    @actor.story = []
    @config[:svn_username] = "turtledove"
    assert_nothing_raised { @scm.checkout(@actor) }
    assert_nil @actor.channels.last.sent_data
    assert_match %r{/path/to/svn co --username turtledove}, @actor.command
  end

  # tests checkout with local repository
  def test_checkout_local
    @actor.story = []
    @config[:repository_is_not_reachable_from_remote]= true

    assert_nothing_raised { @scm.checkout(@actor) }

    assert_equal 2, @scm.local_cmds.size

    # get directory name and file name as this is random and different everytime
    fn= @scm.local_file
    m= fn.match(%r{^(/tmp/CAP_TEMP_\d+\.\d+)\.tar.gz})
    assert_not_nil(m)
    dir= m[1]

    # check the local command was correct
    assert_match %r{/path/to/svn export\s+-q\s+-r\s+/hello/world\s+#{dir}\s+&&\s+tar -C #{dir} -c -z -f #{dir}\.tar\.gz \.\s+&&\s+rm -rf #{dir}}, @scm.local_cmds[0]

    # and that it deleted the temp tar file
    assert_match %r{rm #{dir}\.tar\.gz}, @scm.local_cmds[1]

    assert_nil @actor.channels.last.sent_data

    # check we read and put correct files names
    assert_equal "#{dir}.tar.gz", @actor.put_infile
    assert_equal "#{dir}.tar.gz", @actor.put_outfile

    # check command to remote server is correct
    assert_match %r{mkdir -p [^ ]+\s+&&\s+tar -C [^ ]+ -x -z -f #{dir}\.tar\.gz\s+&&\s+rm -f #{dir}\.tar\.gz}, @actor.command
  end


end

require 'capistrano/scm/base'

module Capistrano
  module SCM

    # An SCM module for using subversion as your source control tool.
    # This module unifies the idea that the subversion repository can be
    # either remote or local, and if remote there maybe a different URL
    # for accessing it from the local machine and the remote machine.
    #
    # to use:
    #   set :scm, :new_subversion
    #
    # This module accepts a <tt>:remote_svn</tt> configuration variable,
    # which (if specified) will be used as the full path to the svn
    # executable on the remote machine:
    #
    #   set :remote_svn, "/usr/local/bin/svn"
    #
    # This module accepts a <tt>:local_svn</tt> configuration variable,
    # which (if specified) will be used as the full path to the svn
    # executable on the local machine:
    #
    #   set :local_svn, "/usr/local/bin/svn"
    #
    # This module accepts a <tt>:repository_is_not_reachable_from_remote</tt> configuration variable,
    # which (if specified) and set to true will only access the subversion repository from the local machine
    #
    #   set :repository_is_not_reachable_from_remote, true
    #
    # This module accepts a <tt>:local_repository_path</tt> configuration variable,
    # which (if specified) is used to access the repository from the local machine if
    # not set it will be the same as  <tt>:repository</tt>
    #
    #   set :local_repository_path, "svn+ssh://host/restofpath/"
    #
    # If used in repository_is_not_reachable_from_remote mode then the default
    # will write some temporary files and directories to /tmp, if this is not available
    # then the <tt>:tmpdir_local</tt> and  <tt>:tmpdir_remote</tt> variables should be
    # set to a safe directory where temp files and directories can be written
    #
    #   set :tmpdir_local, "/usr/tmp"
    #   set :tmpdir_remote, "/home/user/tmp"
    #
    class NewSubversion < Base

      # Return an integer identifying the last known revision in the svn
      # repository. (This integer is currently the revision number.)
      def latest_revision
        @latest_revision ||= begin
          configuration.logger.debug "querying latest revision..."
          match = svn_log(rep_path).scan(/r(\d+)/).first or
          raise "Could not determine latest revision"
          match.first
        end
      end

      # Return a string containing the diff between the two revisions. +from+
      # and +to+ may be in any format that svn recognizes as a valid revision
      # identifier. If +from+ is +nil+, it defaults to the last deployed
      # revision. If +to+ is +nil+, it defaults to HEAD.
      def diff(actor, from=nil, to=nil)
        from ||= current_revision(actor)
        to ||= "HEAD"
        `#{svn} diff #{rep_path}@#{from} #{path}@#{to}`
      end

      # Return the number of the revision currently deployed.
      def current_revision(actor)
        latest = actor.releases.last
        grep = %(grep " #{latest}$" #{configuration.deploy_to}/revisions.log)
        result = ""
        actor.run(grep, :once => true) do |ch, str, out|
          result << out if str == :out
          raise "could not determine current revision" if str == :err
        end

        date, time, user, rev, dir = result.split
        raise "current revision not found in revisions.log" unless dir == latest

        rev.to_i
      end

      # Check out (on all servers associated with the current task) the latest
      # revision. If the subversion repository is accessible from the remote machine
      # Uses the given actor instance to execute the command. If
      # svn asks for a password this will automatically provide it (assuming
      # the requested password is the same as the password for logging into the
      # remote server.)
      def checkout(actor)
        username = configuration[:svn_username] ? "--username #{configuration[:svn_username]}" : ""
        if configuration[:repository_is_not_reachable_from_remote]
          do_local_checkout_and_send(username, actor)
        else
          op = configuration[:checkout] || "co"
          command = "#{svn(true)} #{op} #{username} -q -r#{configuration.revision} #{configuration.repository} #{actor.release_path} &&"
          run_checkout(actor, command, &svn_stream_handler(actor))
        end
      end

      # Update the current release in-place. This assumes that the original
      # deployment was made using checkout, and not something like export.
      def update(actor)
        unless configuration[:repository_is_not_reachable_from_remote]
          command = "cd #{actor.current_path} && #{svn(true)} up -q &&"
          run_update(actor, command, &svn_stream_handler(actor))
        else
          raise "#{self.class} doesn't support update(actor)"
        end
      end

      private

      def rep_path
        configuration[:local_repository_path] || configuration[:repository]
      end

      # returns a different incantation for running svn depending on whether it is running locally or remotely
      def svn(on_remote= false)
        s= nil
        if on_remote
          s=  configuration[:remote_svn]
        else
          s= configuration[:local_svn]
        end
        s || configuration[:svn] || "svn"
      end

      def svn_log(path)
        `#{svn} log -q --limit 1 #{path}`
      end


      def svn_password
        configuration[:svn_password] || configuration[:password]
      end

      def svn_passphrase
        configuration[:svn_passphrase] || svn_password
      end

      def svn_stream_handler(actor)
        Proc.new do |ch, stream, out|
          prefix = "#{stream} :: #{ch[:host]}"
          actor.logger.info out, prefix
          if out =~ /\bpassword.*:/i
            actor.logger.info "subversion is asking for a password", prefix
            ch.send_data "#{svn_password}\n"
          elsif out =~ %r{\(yes/no\)}
            actor.logger.info "subversion is asking whether to connect or not",
            prefix
            ch.send_data "yes\n"
          elsif out =~ %r{passphrase}i
            message = "subversion needs your key's passphrase"
            actor.logger.info message, prefix
            ch.send_data "#{svn_passphrase}\n"
          elsif out =~ %r{The entry \'(\w+)\' is no longer a directory}
            message = "subversion can't update because directory '#{$1}' was replaced. Please add it to svn:ignore."
            actor.logger.info message, prefix
            raise message
          elsif out =~ %r{accept \(t\)emporarily}
            message = "accepting certificate temporarily"
            actor.logger.info message, prefix
            ch.send_data "t\n"
          end
        end
      end

      # checkout from the local machine
      # tar up results
      # send to remote machine(s)
      # unpack into checkout directory
      def do_local_checkout_and_send(username, actor)
        temp_file= "CAP_TEMP_#{Time.now.to_f}"
        tmpdir_local= configuration[:tmpdir_local] || "/tmp"
        temp_dest_local= File.join(tmpdir_local, temp_file)
        tmpdir_remote= configuration[:tmpdir_remote] || "/tmp"
        temp_dest_remote= File.join(tmpdir_remote, temp_file)
        temp_tar_file_local= File.join(tmpdir_local, "#{temp_file}.tar.gz")
        temp_tar_file_remote= File.join(tmpdir_remote, "#{temp_file}.tar.gz")

        configuration.logger.debug "local executing: #{svn} export #{username}  -q -r#{configuration[:revision]} #{rep_path} #{temp_dest_local}"
        configuration.logger.debug "local creating tar file: #{temp_tar_file_local}"

        # always use export in this case as update will never be possible
        run_local(
          "#{svn} export #{username}  -q -r#{configuration[:revision]} #{rep_path} #{temp_dest_local} && " +
          "tar -C #{temp_dest_local} -c -z -f #{temp_tar_file_local} . && " +
          "rm -rf #{temp_dest_local}"
        )

        # send the tar file to the remote machine(s)
        configuration.logger.debug "sending tar file: #{temp_tar_file_local} to remote #{temp_tar_file_remote}"
        actor.put(read_local_file(temp_tar_file_local), temp_tar_file_remote)

        run_local("rm #{temp_tar_file_local}")

        # unpack the tar file on the remote machine as if it has been checked out there
        cmd="mkdir -p #{actor.release_path} && " +
            "tar -C #{actor.release_path} -x -z -f #{temp_tar_file_remote} && " +
            "rm -f #{temp_tar_file_remote}"
        actor.run(cmd)
      end

      # extracted to we can test
      def run_local(cmd)
        system(cmd)
      end

      def read_local_file(fn)
        File.read(fn)
      end

    end
  end
end

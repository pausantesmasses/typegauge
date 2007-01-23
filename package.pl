#!usr/local/bin/perl -w

######################################################################
#
# FF extension Build Script (written by Jonah Bishop)
#
# Last Updated on February 24, 2005
#
# Feel free to use this script to build your own Firefox extensions. You will
# need some sort of file zipping utility. This script makes use of the WinZip
# command line package "wzzip".
#
# *** IMPORTANT NOTE ***
#
# Note that this script has a fairly narrow scope. It makes a number of
# assumptions about the version format, the zip tool being used, and other
# such items. You may need to tweak this script to suit your purposes.
#
# -----------
# Description
# -----------
# This build script updates the version number in the specified files, and
# then packages all of the specified files.
#
# ------------------
# Usage Instructions
# ------------------
# To use this build script as it is written, follow these instructions:
#
#   1. Place this script in the top-level folder of your extension's file
#      structure.
#
#   2. Create two text files: the first should list the files to be added
#      to the JAR file (one file on a line), and the second should list the
#      files to be added to the XPI file (again, one on a line). These files
#      will be used by wzzip. Wild-cards are permitted.
#
#      Place the first text file (describing the JAR file) in the chrome
#      directory. Place the second file in the top-level folder.
#
#   3. Change the variable values in the "user-config" section below.
#
#   4. Run the script.
#
# --------------------
# Command Line Options
# --------------------
# The following command line options are currently supported:
#
#  -r        Rebuilds the JAR and XPI files from scratch
#  -s        Skips the version updating process (only packages the files).
#  -v [num]  Forces the version to be what is specified. Example: -v 1.0.1
#            forces a version of 1.0.1 to be used.
#
######################################################################

use strict;
use Cwd;
use File::Basename;
use Getopt::Std;

# Clear the DOS box (comment out this line if running on a non-Windows platform)
#system "cls";

#===================
#
# User Configuration
#
#===================

# The extension's name
my $EXTNAME = "TypeGauge";

# An array of relative file paths in which a version number should be updated
my @VERSION_FILES = qw/install.rdf/;

# An array of relative package file paths
my @PACKAGE_FILES = qw/chrome\/typegauge.jar typegauge.xpi/;

# A hash of the package list files that we will use
my %PACKAGE_LISTS = ($PACKAGE_FILES[0] => "jarzip.txt", $PACKAGE_FILES[1] => "xpizip.txt");

#==========================
#
# End of user configuration
#
#==========================

our($opt_r, $opt_s, $opt_v);
getopts('rsv:');

my $SKIP_VERSIONING = 0;
my $FORCED_VERSION = "";
my $REBUILD_ALL = 0;

if($opt_s)
{
	$SKIP_VERSIONING = 1;
}

if($opt_v)
{
	$FORCED_VERSION = $opt_v;
}

if($opt_r)
{
	$REBUILD_ALL = 1;
}

print "+--------------------------------+\n";
print "| Firefox Extension Build Script |\n";
print "| Written by Jonah Bishop        |\n";
print "+--------------------------------+\n\n";

print "Now building: $EXTNAME\n\n";

my $HOMEDIR = getcwd();

if($SKIP_VERSIONING == 0)
{
	if($FORCED_VERSION ne "") { print "Forcing a version of $FORCED_VERSION\n"; }
	&updateVersion();
}
else
{
	print "Skipping version update process...\n";
}

if($REBUILD_ALL == 1)
{
	foreach (@PACKAGE_FILES)
	{
		print "Removing package $_...\n";
		unlink $_;
	}
}

foreach my $package(@PACKAGE_FILES)
{
	print "\nUpdating $package using $PACKAGE_LISTS{$package}\n";

	my $dirname = dirname($package);
	print "DIRNAME is $dirname";
	my $basename = basename($package);
	chdir $dirname or die "Cannot change to $dirname: $!";
  print "\nZIPPING -r $basename -\@ < $PACKAGE_LISTS{$package}\n";
	my $progress = `zip -r $basename -\@ < $PACKAGE_LISTS{$package}`;
	print "$progress\n";

	chdir $HOMEDIR or die "Cannot change to $HOMEDIR: $!";
}

#-----------------------------------------------------
# updateVersion
# Usage:  updateVersion()
#
# Description: Takes care of updating the version string in all of the necessary version files.
#-----------------------------------------------------

sub updateVersion()
{
	foreach my $file (@VERSION_FILES)
	{
		print "Updating version information in $file...\n";
		my $dirname = dirname($file);
		my $basename = basename($file);
		chdir $dirname or die "Cannot change to $dirname: $!";
		&parseVersionFile($basename);
	
		print " - Removing $basename\n";
		unlink $basename;
	
		print " - Renaming new_$basename\n\n";
		rename ("new_$basename", $basename);
	
		chdir $HOMEDIR or die "Cannot change to $HOMEDIR: $!";
	}
}

#-----------------------------------------------------
# parseVersionFile
# Usage:  parseVersionFile(filepath)
#
# Description: Locates the version string, passes it off for updating, and writes it to the new file.
#-----------------------------------------------------

sub parseVersionFile
{
	my ($filename) = @_;

	open INPUT, "< $filename" or die "Cannot open input ($filename): $!";
	my @lines = <INPUT>;
	close INPUT;
	
	open OUTPUT, "> new_$filename" or die "Cannot open output (new_$filename): $!";
	
	foreach my $statement (@lines)
	{
		chomp $statement;
		if($statement =~ /(\s*?)<em:version>([^<]+?)<\/em:version>/)
		{
			my $whitespace = $1;
			my $version = $2;

			if($FORCED_VERSION ne "")
			{
				$version = $FORCED_VERSION;
			}
			else
			{
				$version = &incrementVersion($version);
			}

			print OUTPUT "$whitespace";
			print OUTPUT "<em:version>$version<\/em:version>\n";
		}
		elsif($statement =~ /value="Version ([0-9.]+?)"/)
		{
			my $version = $1;

			if($FORCED_VERSION ne "")
			{
				$version = $FORCED_VERSION;
			}
			else
			{
				$version = &incrementVersion($version);
			}

			$statement =~ s/value="[^"]+?"/value="Version $version"/;
			
			print OUTPUT "$statement\n";
		}
		else
		{
			print OUTPUT "$statement\n";
		}
	}
	
	close OUTPUT;
}

#-----------------------------------------------------
# incrementVersion
# Usage:  incrementVersion(versionString)
#
# Description: Returns the incremented value of the incoming version string.
#-----------------------------------------------------
sub incrementVersion
{
	my ($string) = @_;

	my @parts = split /\./, $string;
	@parts = reverse @parts;

	my $carryOne = 0;
	my $firstTime = 1;

	foreach (@parts)
	{
		if($firstTime == 1)
		{
			$firstTime = 0;
			$_++;
		}

		if($carryOne == 1)
		{
			$carryOne = 0;
			$_++;
		}

		if($_ >= 100)
		{
			$carryOne = 1;
			$_ = "00";
		}
	}

	@parts = reverse @parts;

	$string = join ".", @parts;
	$string;
}


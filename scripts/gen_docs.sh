#!/bin/bash

# Figure out where this script resides
scripts_dir=$(dirname "$(readlink -e "${BASH_SOURCE[0]}")")
templates_dir=$(readlink -e "${scripts_dir}/../templates")

source ${scripts_dir}/upstream-docs.conf

# Some docs contain unicode, so avoid failures trying to process them as ascii
export LANG=en_US.utf8

set -e

# Author: Thomas Bechtold <tbechtold@suse.com>
# Author: Jeremy Moffitt <jmoffitt@suse.com>
# Author: Gary Smith <gary.smith@suse.com>
# License: Apache-2.0

# extra tox options (eg. -r)
: ${TOX_OPTS:=""}

# Create entries for the table of contents doc that will be generated
declare -A summary
summary[barbican]='Key Manager service (barbican)'
summary[ceilometer]='Telemetry Data Collection service (ceilometer)'
summary[cinder]='Block Storage service (cinder)'
summary[designate]='DNS service (designate)'
summary[glance]='Image service (glance)'
summary[heat]='Orchestration service (heat)'
summary[horizon]='Dashboard (horizon)'
summary[keystone]='Identity service (keystone)'
summary[magnum]='Container Infrastructure Management service (magnum)'
summary[manila]='Shared File System service (manila)'
summary[murano]='Application Catalog service (murano)'
summary[neutron]='Networking service (neutron)'
summary[octavia]='Load-balancer service (octavia)'
summary[nova]='Compute service (nova)'
summary[sahara]='Data Processing service (sahara)'
summary[swift]='Object Storage service (swift)'
summary[ironic]='Bare Metal service (ironic)'

declare -A title=([admin]='Administrator' [user]='User')

print_title() {
    local markers=$(echo "${@}" | sed 's/./=/g')
    printf "%s\n%s\n%s\n" $markers "${@}" $markers
}

GUIDES="admin user"

cd ${scripts_dir}/source
git clean -fdx

for guide in $GUIDES ; do
    # Overwrite the index.rst from the template
    cp ${scripts_dir}/source/${guide}/index.rst{.tmpl,}
done
cp ${scripts_dir}/source/singlehtml/index.rst{.tmpl,}

for project in $PROJECTS; do
    echo "##### ${project}"
    # Ensure that the repo directory exists
    mkdir -p ${OPENSTACK_REPO_DIR}

    if [[ ! -d ${OPENSTACK_REPO_DIR}/${project} ]]; then
        echo "### Cloning git repo"
        git clone https://git.openstack.org/openstack/${project} ${OPENSTACK_REPO_DIR}/${project} -b ${OPENSTACK_REPO_BRANCH}
    fi
    cd ${OPENSTACK_REPO_DIR}/${project}
    echo "### Clear out any changes that may have come from previous runs"
    git checkout --force ${OPENSTACK_REPO_BRANCH}
    git reset --hard HEAD
    git clean -fd

    echo "### Updating conf.py"
    echo "html_theme = 'suse_sphinx_theme'" >> doc/source/conf.py

    if [ -f doc/requirements.txt ]; then
        echo "### Updating doc/requirements.txt"
        git checkout doc/requirements.txt
        grep -q -x -F 'suse_sphinx_theme' doc/requirements.txt || echo '-e git+https://github.com/SUSE/suse-sphinx-theme.git@master#egg=suse_sphinx_theme' >> doc/requirements.txt
    elif [ -f test-requirements.txt ]; then
        echo "### Updating test-requirements.txt"
        git checkout test-requirements.txt
        grep -q -x -F 'suse_sphinx_theme' test-requirements.txt || echo '-e git+https://github.com/SUSE/suse-sphinx-theme.git@master#egg=suse_sphinx_theme' >> test-requirements.txt
    fi

    # Remove the -W flag on sphinx-build commands to avoid warnings terminating the build
    echo "### Updating tox.ini"

    # Grab the [docs] section of tox.ini and from that pluck out the commands section
    commands=$(sed -n '/docs\]/,/^\[/ p' tox.ini |  sed -n '/^commands/,/^[^ ]/ p' | head --lines=-1)

    # if there is only one command in tox.ini originally, such as
    #   commands = sphinx-build this
    #
    # then split it into multiple lines, in order to add addtional commands, such as
    #   commands =  
    #     sphinx-build this
    #     sphinx-build that
    # otherwise, if there are multiple lines begining with 'commands', then tox will die with an error
   
    # Some tox.ini files use setup.py to build sphinx and others use the sphinx-build command, so handle both
    if [[ $commands =~ python.*setup.py.*build_sphinx ]] ; then
        sed -i '
        /commands *= *python.*setup.py.*build_sphinx/ {
            s/^\(commands *= *\)/\1\n  /          # insert a line break after commands = if it is a single line
            P                                     # print everything up to the line break (i.e. commands = )
            D                                     # delete what we just printed, and then continue processing this modified line
        }
        /python.*setup.py.*build_sphinx/ {
            p                                      # print the line as-is
            s/$/ -b singlehtml/                     # create another copy but with output type of singlehtml
        }' tox.ini

    else
        sed -i '
        /commands *= *sphinx-build.* doc.build.html/ {
            s/^\(commands *= *\)/\1\n  /          # insert a line break after commands = if it is a single line
            P                                     # print everything up to the line break (i.e. commands = )
            D                                     # delete what we just printed, and then continue processing this modified line
        }
        /sphinx-build.* \(doc.build.html\)/ {
            s/ -W / / ; p                           # remove any -W flags that turn warnings into errors, then print the modified line
            s/-b html/-b singlehtml/                # create another cpy of the line, but change the output type to singlehtml
            s#doc/build/html#doc/build/singlehtml#  # and change its output dir. It is printed automatically by sed
        }' tox.ini
    fi

    echo "### Updating document titles"
    for guide in $GUIDES ; do

        if [[ -f ${OPENSTACK_REPO_DIR}/${project}/doc/source/${guide}/index.rst ]] ; then

            doc_title="${project^} ${title[$guide]} Guide"

            # Add the project's guide to the top-level document catalog
            echo "    ${project}/${guide}/index.rst" >> ${scripts_dir}/source/${guide}/index.rst

            # Add a placeholder entry for the guide in the top-level document
            mkdir -p ${scripts_dir}/source/${guide}/${project}/${guide}
            print_title "$doc_title" >> ${scripts_dir}/source/${guide}/${project}/${guide}/index.rst

            # Modify the title of the individual doc.  This is necessary because the document titles
            # are very inconsistent and most do not mention the project name
            ${scripts_dir}/fix_title.py ${OPENSTACK_REPO_DIR}/${project}/doc/source/${guide}/index.rst "$doc_title"
        fi
    done

    # Add the project's guide to the top-level document catalog
    echo "    ${project}/index.rst" >> ${scripts_dir}/source/singlehtml/index.rst

    # Add a placeholder entry for the guide in the top-level document
    mkdir -p ${scripts_dir}/source/singlehtml/${project}
    print_title "${project^} Guide" >> ${scripts_dir}/source/singlehtml/${project}/index.rst

    echo "### Build the theme'd docs"
    tox ${TOX_OPTS} -e docs

done

# Build the top-level documents, which point to placeholders for each project
cd ${scripts_dir}
rm -rf build
echo "### Build the top-level docs"
tox ${TOX_OPTS}

# Replace the placeholder doc with the output of the project doc build
for project in $PROJECTS; do

    # Since admin and user html guides cross-reference into each other, avoid making multiple copies of each.
    # Instead, make a single copy of each project's docs into build/upstream/html, and then symlink to them
    # in the appropriate built doc
    mkdir -p ${scripts_dir}/build/upstream/html/${project}
    rsync -a ${OPENSTACK_REPO_DIR}/${project}/doc/build/html/ ${scripts_dir}/build/upstream/html/${project}

    # replace the placeholder doc with the output of the project doc build
    for guide in $GUIDES ; do
        if [[ -d ${scripts_dir}/build/${guide}/html/${project} ]] ; then
            rm -r ${scripts_dir}/build/${guide}/html/${project}
            ln -s ../../upstream/html/${project} ${scripts_dir}/build/${guide}/html/${project}
        fi
    done

    # replace the placeholder doc with the output of the project doc build
    rm -r ${scripts_dir}/build/singlehtml/${project}
    mkdir -p ${scripts_dir}/build/singlehtml/${project}
    rsync -a ${OPENSTACK_REPO_DIR}/${project}/doc/build/singlehtml/ ${scripts_dir}/build/singlehtml/${project}
done


# Remove duplicate copies of large files and folders
echo "### Remove duplicate generated files"
mkdir -p ${scripts_dir}/build/upstream/html/_shared \
         ${scripts_dir}/build/singlehtml/_shared

for project in $PROJECTS ; do
    for doctype in singlehtml ; do

        if [[ $doctype == html ]] ; then
            cd ${scripts_dir}/build/upstream/html/${project}/_static
        else
            cd ${scripts_dir}/build/singlehtml/${project}/_static
        fi

        for file in favicon.ico *.png *.gif *.js js/*.js fonts/* css/*.css $(find fontawesome fonts images -type f) ; do
            if [[ -f ${file} ]] ; then

                # Create a link target with the appropriate number of ../ entries corresponding
                # to the directory nesting of $file
                link_target=../$(echo $file | sed 's#[^/]*#..#g')/_shared/$file

                # If the file is not already present in the shared area, put it there and create a symlink to it
                if [[ ! -f ../../_shared/${file} ]] ; then
                    mkdir -p $(dirname ../../_shared/${file})
                    cp ${file} ../../_shared/${file}
                    rm ${file}
                    ln -s $link_target ${file}

                # Else if the file is there and it is a duplicate of this project's version, then create a symlink to it
                elif cmp --quiet ${file} ../../_shared/${file} ; then
                    rm ${file}
                    ln -s $link_target ${file}
                fi
            fi
        done

    done
done
find ${scripts_dir}/build -type d -name .doctrees -o -name _sources | xargs rm -rf

# Print the message with surrounding lines of hashes
print_title "The generated docs are in scripts/build/admin and scripts/build/user"

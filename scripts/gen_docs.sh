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
summary[ceilometer]='Telemtry Data Collection service (ceilometer)'
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
    sed -i '/sphinx-build/ s/ -W / /' tox.ini

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

    echo "### Build the theme'd docs"
    tox ${TOX_OPTS} -e docs

done


# Build the top-level documents, which point to placeholders for each project
cd ${scripts_dir}
rm -rf build
echo "### Build the top-level docs"
tox ${TOX_OPTS}

for project in $PROJECTS; do
    mkdir -p ${scripts_dir}/build/upstream/html/${project}

    rsync -a ${OPENSTACK_REPO_DIR}/${project}/doc/build/html/ ${scripts_dir}/build/upstream/html/${project}

    # replace the placeholder doc with the output of the project doc build
    for guide in $GUIDES ; do
        if [[ -d ${scripts_dir}/build/${guide}/html/${project} ]] ; then
            rm -r ${scripts_dir}/build/${guide}/html/${project}
            ln -s ../../upstream/html/${project} ${scripts_dir}/build/${guide}/html/${project}
        fi
    done
done

# Remove duplicate copies of large files and folders
echo "### Remove duplicate generated files"
mkdir -p ${scripts_dir}/build/upstream/html/_shared
for project in $PROJECTS ; do

    cd ${scripts_dir}/build/upstream/html/${project}/_static

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

    rm -rf ${scripts_dir}/build/upstream/html/${project}/{.doctrees,_sources}
done

# Print the message with surrounding lines of hashes
print_title "The generated docs are in scripts/build/admin/html and scripts/build/user/html"

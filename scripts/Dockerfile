FROM opensuse/leap:15.0

MAINTAINER Gary Smith <gary.smith@suse.com>

ADD   ./requirements.txt /

RUN   zypper -n update && \
      zypper -n install \
        cyrus-sasl-devel \
        gcc \
        git \
        graphviz \
        liberasurecode1 \
        liberasurecode-devel \
        libopenssl-devel \
        openldap2-devel \
        pcre-devel \
        python2 \
        python2 \
        python2-devel \
        python3 \
        python3-devel \
        python3-pip \
        python3-tox \
        python-xml

CMD ["/doc-cloud/scripts/gen_docs.sh"]

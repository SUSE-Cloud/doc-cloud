Deploying Designate
-------------------

SUSE OpenStack Cloud uses Designate (DNS as a Service) to create and propgate zones and records over the network
From an administrator's perspective there is not
much to configure as the default for deployment are well in place. Neutron needs some additional
settings for integration with Designate[1], the barclamp currently does not configure these but if
required the admin can enable these as required. These configuration parameters can be added in a file 
in the /etc/neutron/neutron.conf.d/ directory.
However the Neutron-Designate direct integration mentioned here[2] is already configured.

This designate barclamp relies heavily on DNS barclamp and expects it to be applied without any
failures.

- designate-server role
this role will install the Designate server packages and configure mini-dns (mdns) service required
by designate

- designate-worker role
this role configures a Designate worker on the selected nodes. Designate uses the workers to distribute
its workload.

Designate Sink is an optional service and is not configured as part of this barclamp

Designate uses pool(s) over which it can distribute zones and records, these pool(s) are not
created by crowbar. Pools can have varied configuration and any misconfiguration can lead to
information leakage.

One possible configuration of pools is created by by crowbar on node with designate-api role in
`/etc/designate/pools.crowbar.yaml`
Admins can copy this file and edit it as their requirements and later provide this config to
designate using the cmd:

`designate-manage pool update --file /etc/designate/pools.crowbar.yaml`

Once the pool is create only then can the TLD's and zones be created:
these TLD's and zone are needed by Neutron to be able to create dns record because
of integration [2] and should be in accordance with the dns_domain settings in the Neutron barclamp

eg:
when dns_doamin = openstack.local.`
then tld is `local` 
and zone is `openstack.local.`
tld in designate is created using:
`openstack tld create --name local` 
and zone using:
`openstack zone create --email admin@company.org openstack.local.` 
this command needs to be run every time the dns_domain settings is changed



1 -  https://docs.openstack.org/designate/latest/contributor/integrations.html
2 - https://docs.openstack.org/ocata/networking-guide/config-dns-int.html
TLD=Top Level Domain

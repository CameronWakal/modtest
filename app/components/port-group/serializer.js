import ApplicationSerializer from '../../serializers/application';

export default class PortGroupSerializer extends ApplicationSerializer {
  attrs = {
    basePorts: { embedded: 'always' },
    expansionPorts: { embedded: 'always' }
  };
}

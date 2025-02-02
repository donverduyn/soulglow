import { makeAutoObservable } from 'mobx';

interface EndpointContract extends Identifiable, Nameable, Resolvable {}

export class EndpointEntity {
  private data: EndpointContract;

  constructor(data: EndpointContract) {
    this.data = data;
    makeAutoObservable(this);
  }

  get id() {
    return this.data.id;
  }

  get url() {
    return this.data.url;
  }

  get calculatedField() {
    return this.data.name.toUpperCase();
  }
}

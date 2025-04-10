import { makeAutoObservable } from 'mobx';

interface EndpointContract extends Identifiable, Nameable, Resolvable {
  updatedAt: string;
}

export class EndpointEntity {
  private endpoint: EndpointContract;

  constructor(data: EndpointContract) {
    this.endpoint = data;
    makeAutoObservable(this);
  }

  get id() {
    return this.endpoint.id;
  }

  get url() {
    return this.endpoint.url;
  }

  get updatedAt() {
    return this.endpoint.updatedAt;
  }

  set url(value: string) {
    this.endpoint.url = value;
  }

  get calculatedField() {
    return this.endpoint.name.toUpperCase();
  }
}

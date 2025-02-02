class HttpApi {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fetch<T>(url: string, options?: Record<string, unknown>): Promise<T> {
    return fetch(url).then((response) => response.json());
  }
}

export abstract class Repository<T> {
  constructor(private httpApi: HttpApi) {}

  get(): Promise<T> {
    return this.httpApi.fetch<T>('/api/data');
  }

  set(newData: T): Promise<T> {
    return this.httpApi.fetch<T>('/api/data', {
      body: JSON.stringify(newData),
      method: 'POST',
    });
  }

  update(updater: (data: T) => T): Promise<T> {
    return this.get().then((data) => this.set(updater(data)));
  }

  delete(): Promise<unknown> {
    return this.httpApi.fetch('/api/data', {
      method: 'DELETE',
    });
  }
}

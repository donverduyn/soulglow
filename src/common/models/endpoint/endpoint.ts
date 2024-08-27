// // the minimum required fields for an endpoint that are applicable across bounded contexts
export interface Endpoint extends Identifiable {
  name: string;
  url: string;
}

interface Identifiable {
  id: string;
}

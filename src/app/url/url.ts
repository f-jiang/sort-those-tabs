interface HashTable<T> {
  [key: string]: T;
}

export declare class Url {

  public protocol: string;
  public slashes: boolean;
  public auth: string;
  public username: string;
  public password: string;
  public host: string;
  public hostname: string;
  public port: number;
  public pathname: string;
  public query: HashTable<string>;
  public hash: string;
  public href: string;
  public origin: string;
  public set(key: string, value: string): void;
  public toString(): string;

}

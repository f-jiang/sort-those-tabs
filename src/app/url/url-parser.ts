import { Injectable } from '@angular/core';

import * as urlParse from 'url-parse';

import { Url } from './url';

@Injectable()
export class UrlParser {

  public parse(url: string, parseQuery= true): Url {
    return urlParse(url, parseQuery);
  }

}

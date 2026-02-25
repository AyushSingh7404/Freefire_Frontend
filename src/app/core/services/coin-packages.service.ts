import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CoinPackage, ApiCoinPackage } from '../models/coin-package.model';

@Injectable({ providedIn: 'root' })
export class CoinPackagesService {
  private readonly url = `${environment.apiUrl}/coin-packages`;

  constructor(private http: HttpClient) {}

  /** GET /coin-packages — returns active packages ordered by sort_order */
  getPackages(): Observable<CoinPackage[]> {
    return this.http.get<ApiCoinPackage[]>(this.url).pipe(
      map(packages => packages.map(p => ({
        id: p.id,
        coins: p.coins,
        priceInr: p.price_inr,
        isPopular: p.is_popular,
        sortOrder: p.sort_order,
      })))
    );
  }
}

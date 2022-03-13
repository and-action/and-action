import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepositoryFilterService implements OnDestroy {
  private filterValueSubject = new BehaviorSubject<string>('');

  get filterValue$() {
    return this.filterValueSubject.asObservable();
  }

  ngOnDestroy() {
    this.filterValueSubject.complete();
  }

  setValue(value: string) {
    this.filterValueSubject.next(value);
  }
}

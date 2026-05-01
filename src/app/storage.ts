import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Interfaz para estandarizar las respuestas del servicio
export interface StorageResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly MASTER_KEY = 'users';

  private masterSubject = new BehaviorSubject<Record<string, any>>({});

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    try {
      const data = localStorage.getItem(this.MASTER_KEY);
      const parsedData = data ? JSON.parse(data) : {};
      this.masterSubject.next(parsedData);
    } catch (e) {
      console.error('Error leyendo el localstorage', e);
      this.masterSubject.next({});
    }
  }

  watchKey(key: string): Observable<any> {
    return this.masterSubject.asObservable().pipe(map((data) => data[key] || null));
  }

  getKeyValue(key: string): any {
    return this.masterSubject.getValue()[key] || null;
  }
  saveData(key: string, item: any): Observable<StorageResponse> {
    return of(null).pipe(
      delay(2000),
      map(() => {
        const currentData = this.masterSubject.getValue();

        if (currentData.hasOwnProperty(key)) {
          return {
            success: false,
            message: `Error: El usuario ya existe.`,
          };
        }
        const updatedData = {
          ...currentData,
          [key]: item,
        };

        localStorage.setItem(this.MASTER_KEY, JSON.stringify(updatedData));

        this.masterSubject.next(updatedData);

        return {
          success: true,
          message: `Usuario guardado exitosamente.`,
        };
      }),
    );
  }
}

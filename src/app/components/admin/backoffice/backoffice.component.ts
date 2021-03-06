import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartType } from 'chart.js';
import { ListaService } from './../../../shared/services/lista.service';
import { UserService } from './../../../shared/services/user.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-backoffice',
  templateUrl: './backoffice.component.html',
  styleUrls: ['./backoffice.component.scss']
})

/**
 * @author Borja Pérez Mullor <multibalcoy@gmail.com>
 */

export class BackofficeComponent implements OnInit, OnDestroy {
  currentYear: number;
  usuariosRegistrados: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  usuariosPremium: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  listasCreated: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  private observableGetlista: any;
  private observableGetUser: any;

  doughnutChartLabels: string[];
  doughnutChartRegisterUsers: Array<any>;
  doughnutChartPremiumUsers: Array<any>;
  doughnutChartCreatedLists: Array<any>;

  // Tipo de grafico que se mostrará
  public doughnutChartType: ChartType = 'doughnut';

  constructor(
    private listaService: ListaService,
    private userService: UserService,
    private location: Location) {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit() {
    // Llamamos a la funcion que asignará todos los valores a sus variables
    this.observableGetlista = this.listaService.getListas().subscribe(Response => this.fillDataListas(Response));

    // Llamamos a la funcion que asignará todos los valores a sus variables
    this.observableGetUser = this.userService.getUsers().subscribe(Response => this.fillDataUsers(Response));

  }

  /**
   * Summary: Get the data passed by param and assign it to the consts in case of the users be 1 or 2 for use the carts
   * @param Response Is the response from the API (database)
   */
  fillDataUsers(Response: any): void {
    for (const item of Response) {
      if (item.role === 1) {
        for (let mes = 1; mes < 13; mes++) {
          if (mes < 10) {
            if (item.created_at.includes(this.currentYear.toString() + '-0' + mes)) {
              this.usuariosRegistrados[mes]++;
            }
          } else {
            if (item.created_at.includes(this.currentYear.toString() + '-' + mes)) {
              this.usuariosRegistrados[mes]++;
            }
          }
        }
      } else if (item.role === 2) {
        for (let mes = 1; mes < 13; mes++) {
          if (mes < 10) {
            if (item.created_at.includes(this.currentYear.toString() + '-0' + mes)) {
              this.usuariosPremium[mes]++;
            }
          } else {
            if (item.created_at.includes(this.currentYear.toString() + '-' + mes)) {
              this.usuariosPremium[mes]++;
            }
          }
        }
      }

    }
    // Valores obtenidos de la base de datos para usuarios registrados
    this.doughnutChartRegisterUsers =
      [this.usuariosRegistrados[1], this.usuariosRegistrados[2], this.usuariosRegistrados[3],
      this.usuariosRegistrados[4], this.usuariosRegistrados[5], this.usuariosRegistrados[6],
      this.usuariosRegistrados[7], this.usuariosRegistrados[8], this.usuariosRegistrados[9],
      this.usuariosRegistrados[10], this.usuariosRegistrados[11], this.usuariosRegistrados[12]];

    // Valores obtenidos de la base de datos para usuarios premium
    this.doughnutChartPremiumUsers =
      [this.usuariosPremium[1], this.usuariosPremium[2], this.usuariosPremium[3],
      this.usuariosPremium[4], this.usuariosPremium[5], this.usuariosPremium[6],
      this.usuariosPremium[7], this.usuariosPremium[8], this.usuariosPremium[9],
      this.usuariosPremium[10], this.usuariosPremium[11], this.usuariosPremium[12]];

    // Clases donde se almacenerán los valores
    this.doughnutChartLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
      'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  }

  /**
   * Summary: Get the data passed by param and assign it to the consts for show when the lists have beencreated
   * @param Response Is the response from the API (database)
   */

  fillDataListas(Response: any): void {
    for (const item of Response) {
      for (let mes = 1; mes < 13; mes++) {
        if (mes < 10) {
          if (item.created_at.includes(this.currentYear.toString() + '-0' + mes)) {
            this.listasCreated[mes]++;
          }
        } else {
          if (item.created_at.includes(this.currentYear.toString() + '-' + mes)) {
            this.listasCreated[mes]++;
          }
        }
      }

      // Clases donde se almacenerán los valores
      this.doughnutChartLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
        'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

      // Valores obtenidos de la base de datos para listas creadas
      this.doughnutChartCreatedLists = [
        this.listasCreated[1], this.listasCreated[2], this.listasCreated[3],
        this.listasCreated[4], this.listasCreated[5], this.listasCreated[6],
        this.listasCreated[7], this.listasCreated[8], this.listasCreated[9],
        this.listasCreated[10], this.listasCreated[11], this.listasCreated[12],
      ];
    }
  }

  /**
   * Redirects to the last URL used.
   */
  onGoBack(): void {
    this.location.back();
  }

  ngOnDestroy() {
    if (this.observableGetlista) {
      this.observableGetlista.unsubscribe();
    }
    if (this.observableGetUser) {
      this.observableGetUser.unsubscribe();
    }
  }
}

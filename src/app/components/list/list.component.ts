import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ILista } from '../../shared/models/IListas.interface';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { FormControl, Validators } from '@angular/forms';
import { SnackbarDisplayerService } from '../../shared/services/snackbar-displayer.service';
import { SnackBarErrorType } from 'src/app/shared/enums/snackbar-error-type.enum';
import { ListaService } from 'src/app/shared/services/lista.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ShowDialogComponent } from './show-dialog/show-dialog.component';
import { Captcha } from 'src/app/shared/classes/Captcha.class';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

/**
 * @author Jose Gracia Berenguer <jgracia9988@gmail.com>
 */
export class ListComponent extends Captcha implements OnInit, OnDestroy {
  @Input() list: ILista;

  @ViewChild('newElementInput', { static: false }) newElementInput: ElementRef;
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  public titulo: FormControl;
  public descripcion: FormControl;
  public password: FormControl;
  public passwordAuth: FormControl;

  private observableGetLista: any;
  private observableSubmit: any;

  submittedOnce: boolean;
  public isHidden: boolean;
  public hasPassword: boolean;
  public passwordIsAllowed: boolean;
  public isEditing: boolean;

  public isLocked: boolean;
  windowHeight: number;

  constructor(
    private errorSnackbarDisplayerService: SnackbarDisplayerService,
    private listaService: ListaService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private userService: UserService) {
    super();
    this.titulo = new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60)]);
    this.descripcion = new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60)]);
    this.password = new FormControl('', [Validators.required, Validators.minLength(4)]);
    this.passwordAuth = new FormControl('', [Validators.required, Validators.minLength(4)]);
    this.isEditing = false;
    this.passwordIsAllowed = true;
    this.list = { // default list
      titulo: '',
      descripcion: '',
      items: [],
      captcha: '',
      listaAuth: ''
    };
  }

  ngOnInit() {
    let listaId: number;
    if (!this.authService.hasToken()) { // the user will not have the password field if not logged

      this.passwordIsAllowed = false;
    }
    this.windowHeight = window.innerHeight / 2.5; // asign the right PXs for the scrollable list
    const givenUrl = this.route.snapshot.paramMap.get('url');
    if (givenUrl) { // if is editing
      this.isEditing = true;
      this.observableGetLista = this.listaService.getLista(givenUrl).subscribe(Response => {
        if (Response.message === 'Error, indique la contraseña de la lista') { // has to specify the password
          this.isLocked = true;
        } else { // there is no password or is already sent and the user can retreive it
          try {
            listaId = Response.user_id;
            this.list = {
              titulo: '',
              descripcion: '',
              items: JSON.parse(JSON.parse(Response.elementos)),
              url: givenUrl,
              captcha: '',
              listaAuth: ''
            };
          } catch {
            this.router.navigate(['/list']);
            this.errorSnackbarDisplayerService.openSnackBar(
              'Error al recibir el elemento, ¿es posible que no exista la lista?', SnackBarErrorType.error);
          }
          this.titulo.setValue(Response.titulo);
          this.descripcion.setValue(Response.descripcion);
          if (this.authService.hasToken()) { // if the user is logged in
            this.userService.getDataUser().subscribe((ResponseUser) => {
              // will disallow the password field if that list isn't own by the logged user or is not admin
              if (ResponseUser.user || ResponseUser.user.id !== listaId || ResponseUser.user.role === 1) {
                this.passwordIsAllowed = false;
              }
            });
          }
        }
      });
    } else {
      if (!this.authService.hasToken()) {
        this.passwordIsAllowed = false;
      } else {
        this.userService.getDataUser().subscribe(Response => {
          if (Response.user.role === 1) {
            this.passwordIsAllowed = false;
          }
        });
      }
    }
  }

  /**
   * Summary: called by the html. receives an input element and adds its value to the element list being master and
   * without any subtasks.
   *
   * @param newElement an HTML input element to be added
   */
  onAddElement(newElement: HTMLInputElement): void {
    if (newElement.value) { // if the element exists
      this.addElement(newElement.value);
      newElement.value = '';
    }
    this.newElementInput.nativeElement.focus(); // add the focus again
  }

  /**
   * Summary: receives an order number (id - like) of an element and deletes it.
   *
   * @param order the order number of the element that we want to delete.
   */
  onDeleteElementMaster(order: number): void {
    this.list.items = this.list.items.filter(element => element.order !== order);
    this.refreshOrder();
  }

  /**
   * Summary: receives an order number (id - like) of its parent element and removes
   * the slave (subtaks) searching by its name (text).
   *
   * @param order order of the parent. the order refeers to the list.items position.
   * @param text the text of the slave element to be removed.
   */
  onDeleteSlave(order: number, text: string): void {
    this.list.items[order].subTasks =
      this.list.items[order].subTasks.filter(slave => slave.name !== text);
  }

  /**
   * Summary: receives an order number (id - like) of an master element and turns it
   * into a slave element.
   *
   * @param order the order number of the element that we want to make slave.
   */
  onMakeSlave(order: number): void {
    if (this.list.items[0].order !== order) {
      const futureSlave = this.list.items.find(elemento => elemento.order === order);
      if (futureSlave) {
        futureSlave.master = false;
        for (let i = futureSlave.order; i >= 0; i--) { // asign the master of the futureSlave
          if (typeof this.list.items[i] !== 'undefined' && this.list.items[i].master) {
            this.list.items[i].subTasks.push({ name: futureSlave.text });
            this.onDeleteElementMaster(futureSlave.order);
            break;
          }
        }
        futureSlave.subTasks.forEach(subTaskOrder => {// foreach every subtask, and make them master (they are freed from the master)
          this.addElement(subTaskOrder.name);
        });
        futureSlave.subTasks = []; // remove the subtasks of the future slave
        this.refreshOrder(); // refresh the order
      }
    } else {
      this.errorSnackbarDisplayerService.openSnackBar('No puedes hacer un subelemento del primer elemento!', SnackBarErrorType.warning);
    }
  }

  /**
   * Summary: receives an order number (id - like) of an subelement/slave element and turns it
   * into a master element.
   *
   * @param order the order number of the element that we want to make master.
   * @param text the text of the future master element.
   */
  onMakeMaster(order: number, text: string): void {
    this.onDeleteSlave(order, text);
    this.addElement(text);
    this.refreshOrder();
  }

  onSubmit(): void {
    this.submittedOnce = true;
    if (this.list.items.length > 0) {
      if (this.hasPassword && this.isEditing) { // has password and is editing
        this.inputs = [this.titulo, this.descripcion, this.password];
      } else if (this.hasPassword && !this.isEditing) { // has password and is creating
        this.inputs = [this.titulo, this.descripcion, this.password, this.captcha];
      } else if (!this.hasPassword && this.isEditing) { // without password and its editing
        this.inputs = [this.titulo, this.descripcion];
      } else if (!this.hasPassword && !this.isEditing) { // without password and its creating
        this.inputs = [this.titulo, this.descripcion, this.captcha];
      }

      this.list.captcha = this.captcha.value;
      this.list.titulo = this.titulo.value;
      this.list.descripcion = this.descripcion.value;
      this.list.elementos = JSON.stringify(this.list.items);
      this.list.passwordLista = this.passwordAuth.value;

      if (this.validateInputs()) { // IF THE INPUTS ARE VALID
        if (this.isEditing) { // EDITING
          this.observableSubmit = this.listaService.putListaRegistered(this.list).subscribe((Response) => {
            if (typeof Response.lista !== 'undefined') {
              this.openDialog(Response.lista.url);
            }
            this.errorSnackbarDisplayerService.openSnackBar('Lista guardada', SnackBarErrorType.success);
          });

        } else { // CREATING
          this.list.passwordLista = this.password.value;
          this.list.url = this.list.titulo;
          this.observableSubmit = this.listaService.postListaRegistered(this.list).subscribe((Response) => {
            if (typeof Response.lista !== 'undefined') {
              this.openDialog(Response.lista.url);
              this.errorSnackbarDisplayerService.openSnackBar('Lista guardada', SnackBarErrorType.success);
            }
          });
        }
      } else { // IF ANY INPUT IS NOT OK
        this.errorSnackbarDisplayerService.openSnackBar('Valores incorrectos', SnackBarErrorType.warning);
      }
    } else {
      this.errorSnackbarDisplayerService.openSnackBar('Añade al menos un elemento a la lista', SnackBarErrorType.warning);
    }
  }

  /**
   * Summary: receives a drag event and switches positions and reflects it in the main array.
   *
   * @param event the event received to switch two element positions.
   */
  onDrop(event: CdkDragDrop<string[]>): void {
    const aux = this.list.items[event.currentIndex].order;
    this.list.items[event.currentIndex].order = this.list.items[event.previousIndex].order;
    this.list.items[event.previousIndex].order = aux;
    moveItemInArray(this.list.items, event.previousIndex, event.currentIndex);
    this.refreshOrder();
  }

  /**
   * Refreshes the order of the elements. Every order property will pertain at its own
   * array position.
   */
  private refreshOrder(): void {
    let counter = 0;
    for (const element of this.list.items) {
      if (element) {
        element.order = counter;
        counter++;
      }
    }
  }

  /**
   * Summary: adds an element to the element.list being master and without any subtasks,
   * but first checks if that element doesn't exist as master or slave.
   *
   * @param newElement the text to be added.
   */
  private addElement(newElement: string): void {
    let isRepeated = false;
    // check for repeated elements as master
    if (this.list.items.find(element => element.text === newElement)) {
      isRepeated = true;
    }
    if (!isRepeated) { // if still wasn't found any ocurrence...
      // check for repeated elements as slave
      this.list.items.forEach(element => {
        if (element.subTasks.find(subTask => subTask.name === newElement)) {
          isRepeated = true;
        }
      });
    }
    if (!isRepeated) { // element not repeated (ok)
      this.list.items.push({
        order: this.list.items.length + 1,
        text: newElement.trim(),
        master: true,
        subTasks: []
      });
    } else { // if the element was repeated, dont add it
      this.errorSnackbarDisplayerService.openSnackBar(`El elemento ${newElement} ya existe.`, SnackBarErrorType.warning);
    }
  }

  /**
   * Summary: Opens the dialog angular material component.
   *
   * @param url url of the created/edited list.
   */
  openDialog(url: string): void {
    this.dialog.open(ShowDialogComponent, {
      data: {
        url
      }
    });
  }

  /**
   * Summary: invoked when the list has a passowrds and the user introduces it.
   */
  onPasswordSubmit(): void {
    const givenUrl = this.route.snapshot.paramMap.get('url');
    const listPassword = '' + givenUrl + '/' + this.passwordAuth.value;

    this.listaService.getListaPassword(listPassword).subscribe(Response => {
      if (Response.message === 'Error, indique la contraseña de la lista') {
        this.errorSnackbarDisplayerService.openSnackBar('La contraseña es incorrecta', SnackBarErrorType.error);
      } else {
        this.isLocked = false;

        this.list = {
          titulo: '',
          descripcion: '',
          items: JSON.parse(JSON.parse(Response.elementos)),
          url: givenUrl,
          captcha: '',
          listaAuth: ''
        };
        this.list.listaAuth = this.passwordAuth.value;
        this.titulo.setValue(Response.titulo);
        this.descripcion.setValue(Response.descripcion);
      }
    });
  }

  /**
   * Summary: checks if the input has any error, and if that is the case it will return a string
   * with the problem, if there is no error it will simply return an empty string.
   *
   * @return string of the first error found.
   */
  getTituloErrorMessage(): string {
    return this.titulo.hasError('required') ? 'Debes introducir un titulo' :
      this.titulo.hasError('minlength') ? 'Debes de introducir un titulo con al menos 4 carácteres.' :
        this.titulo.hasError('maxLength') ? 'Debes de introducir un titulo con menos de 60 carácteres.' :
          '';
  }

  /**
   * Summary: checks if the input has any error, and if that is the case it will return a string
   * with the problem, if there is no error it will simply return an empty string.
   *
   * @return string of the first error found.
   */
  getDescripcionErrorMessage(): string {
    return this.descripcion.hasError('required') ? 'Debes introducir una descripción' :
      this.descripcion.hasError('minlength') ? 'Debes de introducir una descripción con al menos 4 carácteres.' :
        this.descripcion.hasError('maxLength') ? 'Debes de introducir una descripción con menos de 60 carácteres.' :
          '';
  }

  /**
   * Summary: checks if the input has any error, and if that is the case it will return a string
   * with the problem, if there is no error it will simply return an empty string.
   *
   * @return string of the first error found.
   */
  getPasswordErrorMessage(): string {
    return this.password.hasError('required') ? 'Debes introducir una contraseña' :
      this.password.hasError('minlength') ? 'Debes de introducir una contraseña con al menos 4 carácteres.' :
        '';
  }

  ngOnDestroy(): void {
    if (this.observableGetLista) {
      this.observableGetLista.unsubscribe();
    }
    if (this.observableSubmit) {
      this.observableSubmit.unsubscribe();
    }
  }
}

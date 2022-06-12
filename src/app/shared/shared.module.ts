import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditCardComponent } from './components/credit-card/credit-card.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    CreditCardComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    CreditCardComponent,
  ],
})
export class SharedModule { }

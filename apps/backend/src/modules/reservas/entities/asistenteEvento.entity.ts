import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { AsistenteEvento } from '@eventos/shared';

@Entity({ name: 'asistenteEvento' })
export class AsistenteEventoEntity implements AsistenteEvento {
  @PrimaryColumn({ name: 'idSubEvento', type: 'int' })
  idSubEvento: number;

  @PrimaryColumn({ name: 'idUsuario', type: 'int' })
  idUsuario: number;

  @Column({ name: 'idBoleto', type: 'int', nullable: true })
  idBoleto: number;
}
import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'eventoPersonalLogistica' })
export class EventoPersonalLogisticaEntity {
  @PrimaryColumn({ name: 'idEvento', type: 'int' })
  idEvento: number;

  @PrimaryColumn({ name: 'idUsuario', type: 'int' })
  idUsuario: number;
}
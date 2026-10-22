import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'estadoBoleto' })
export class EstadoBoletoEntity {
  @PrimaryGeneratedColumn({ name: 'idEstadoBoleto' })
  idEstadoBoleto: number;

  @Column({ name: 'estado', type: 'varchar', length: 100 })
  estado: string;
}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ponente')
export class PonenteEntity {
  @PrimaryGeneratedColumn({ name: 'idPonente', type: 'integer' })
  idPonente: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  nombre: string;

  @Column({ name: 'apellidoPa', type: 'varchar', length: 50 })
  apellidoPa: string;

  @Column({ name: 'apellidoMa', type: 'varchar', length: 50, nullable: true })
  apellidoMa: string | null;

  @Column({ name: 'correo', type: 'varchar', length: 254 })
  correo: string;

  @Column({ name: 'idSubEvento', type: 'integer' })
  idSubEvento: number;
}
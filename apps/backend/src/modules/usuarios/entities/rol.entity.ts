import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'rol' })
export class RolEntity {
  @PrimaryGeneratedColumn({ name: 'idRol', type: 'int' })
  idRol!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  rol!: number;
}
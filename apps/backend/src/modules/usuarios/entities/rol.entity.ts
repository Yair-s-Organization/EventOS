import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from '@eventos/shared';

@Entity({ name: 'rol' })
export class RolEntity implements Rol {
  @PrimaryGeneratedColumn({ name: 'idRol', type: 'int' })
  idRol!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 50 })
  rol!: Rol['rol'];
}

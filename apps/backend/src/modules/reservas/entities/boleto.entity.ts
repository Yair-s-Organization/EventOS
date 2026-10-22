import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoBoleto } from '@eventos/shared';

@Entity({ name: 'boleto' })
export class BoletoEntity {
  @PrimaryGeneratedColumn({ name: 'idBoleto' })
  idBoleto: number;

  @Column({ name: 'tokenQR', type: 'varchar', length: 500 })
  tokenQr: string;

  @Column({ name: 'fechaGeneracion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaGeneracion: Date;

  @Column({ name: 'idAsiento', type: 'int', nullable: true })
  idAsiento: number | null;

  @Column({ name: 'idEstadoBoleto', type: 'int', default: EstadoBoleto.VALIDO })
  idEstadoBoleto: EstadoBoleto;
}
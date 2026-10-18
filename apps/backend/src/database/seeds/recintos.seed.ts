import dataSource from '../data-source';
import { RecintoEntity } from '../../modules/recintos/entities/recinto.entity';

export async function seedRecintos() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const recintoRepo = dataSource.getRepository(RecintoEntity);

  const count = await recintoRepo.count();
  if (count > 0) {
    console.log('Los recintos ya fueron sembrados previamente.');
    return;
  }

  const recintosIniciales = [
    {
      nombre: 'Auditorio Principal',
      computadorasDisponibles: 0,
      idEstadoRecinto: 1,
    },
    {
      nombre: 'Laboratorio de Cómputo A',
      computadorasDisponibles: 35,
      idEstadoRecinto: 1,
    },
    {
      nombre: 'Laboratorio de Cómputo B',
      computadorasDisponibles: 25,
      idEstadoRecinto: 1,
    },
    {
      nombre: 'Sala 14',
      computadorasDisponibles: 0,
      idEstadoRecinto: 1,
    },
  ];

  await recintoRepo.save(recintosIniciales);
  console.log('${recintosIniciales.length} recintos sembrados exitosamente.');
}

// Ejecución directa con bun (bun src/database/seeds/recintos.seed.ts)
if (import.meta.main) {
  seedRecintos()
    .then(async () => {
      await dataSource.destroy();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error al sembrar recintos:', error);
      process.exit(1);
    });
}


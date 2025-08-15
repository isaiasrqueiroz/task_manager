
export enum TaskCategory {
  Ciclo = 'Ciclo',
  Cadastro = 'Cadastro',
  Apontamento = 'Apontamento',
  Relatorio = 'Relatório',
  Corretiva = 'Corretiva',
}

export enum TaskStatus {
  Aguardando = 'Aguardando',
  EmDesenvolvimento = 'Em desenvolvimento',
  EmTestes = 'Em testes',
  EmHomologacao = 'Em Homologação',
  AguardandoDeploy = 'Aguardando Deploy',
  DeployFinalizado = 'Deploy finalizado',
}

export interface Task {
  id: number;
  taskId: string;
  descricao: string;
  categoria: TaskCategory;
  status: TaskStatus;
  urgente: boolean;
  importante: boolean;
  estimatedHours: number;
  startDate: Date;
  deadline: Date;
  completionDate?: Date | null;
  daysLeft?: number;
}
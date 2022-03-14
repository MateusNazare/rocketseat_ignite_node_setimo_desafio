import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    sender_id,
    amount,
    description,
    type
  }: ICreateStatementDTO): Promise<Statement> {

    let senderId;

    if (sender_id) {
      senderId = user_id;
      user_id = sender_id;
    }

    const statement = this.repository.create({
      user_id,
      sender_id: senderId,
      amount,
      description,
      type,
    });

    return await this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    let statement = await this.repository.find({
      where: { user_id }
    });

    const statementSended = await this.repository.find({
      where: { sender_id: user_id }
    });

    let balance = statement.reduce((acc, operation) => {
      if (operation.type === 'deposit' || operation.type === 'transfer') {
        return acc + parseFloat(String(operation.amount));
      } else {
        return acc - parseFloat(String(operation.amount));
      }
    }, 0);

    statement = statement.concat(statementSended);

    const statementTransferValues = statementSended.reduce(
      (total = balance, operation) => {
        return total + parseFloat(String(operation.amount));
      },
      0
    );

    balance -= statementTransferValues | 0;

    if (with_statement) {
      return {
        statement,
        balance,
      }
    }

    return { balance }
  }
}

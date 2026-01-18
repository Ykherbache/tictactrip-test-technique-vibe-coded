export abstract class AbstractUseCase<Input, Output> {
  async execute(input: Input): Promise<Output> {
    return this.handle(input);
  }

  protected abstract handle(input: Input): Promise<Output> | Output;
}

declare module "evp-express" {
  /**
   * EvpExpress error
   */
  export interface EvpErrorMessage {
    status?: number,
    code?: number,
    msg: string,
    symbol?: number,
    data?: any,
    back?: boolean
  }

  export type ErrorStrategyArgs = [string,number|undefined,any,number|undefined]

  /**
   * EvpExpress error handler
   */
  export interface EvpErrorHandler{
    ( err: Error,
      req: import('express').Request,
      res: import('express').Response,
      next: import('express').NextFunction
    ): void
  }

  export type ExhandleStrategyMap = Map<number,(res:import('express').Response,...args:import('evp-express').ErrorStrategyArgs)=>void>;
}
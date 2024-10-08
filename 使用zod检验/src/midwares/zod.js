const { z } = require("zod");

/**
 * @typedef {{
 * code: string;
 * expected: string;
 * received: any;
 * path: string[];
 * message: string;
 * }} MyZodError
 */

/**
 * @param {z.ZodError} errors 
 * @reutrns
 */
function selFirstError(errors) {
  /**
   * @type {MyZodError[]}
   */
  const errs = JSON.parse(errors);
  return errs[0];
}

module.exports = {
  /**
   * 
   * @param {{
   * headers: z.ZodObject|undefined;
   * params: z.ZodObject|undefined;
   * query: z.ZodObject|undefined;
   * body: z.ZodObject|undefined;
   * }} param0 
   * @returns
   */
  ZodValid: ({headers, params, query, body})=>{
    /**
     * @type {import("express").RequestHandler}
     */
    const handler = (req,res,next)=>{
      if (headers) {
        const result = headers.safeParse(req.headers);
        if (!result.success) {
          throw new Error(selFirstError(result.error).message)
        }
      }
      if (params) {
        const result = params.safeParse(req.params);
        if (!result.success) {
          throw new Error(selFirstError(result.error).message)
        }
      }
      if (query) {
        const result = query.safeParse(req.query);
        if (!result.success) {
          throw new Error({
            msg: selFirstError(result.error).message,
            back: true
          })
        }
      }
      if (body) {
        console.log(req.body);
        const result = body.safeParse(req.body);
        if (!result.success) {
          throw new Error(selFirstError(result.error).message)
        }
      }
      next();
    }
    return handler;
  }
}
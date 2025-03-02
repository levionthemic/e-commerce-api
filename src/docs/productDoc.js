/**
 * @swagger
 * tags:
 *   name: Product
 *   description: API Product Management
 */

/**
 * @swagger
 * /v1/products:
 *    get:
 *      tags: [Product]
 *      summary: Get list of products with pagination and search
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *          description: current page
 *        - in: query
 *          name: itemsPerPage
 *          schema:
 *            type: integer
 *          description: number of items on a page, default is 40
 *        - in: query
 *          name: q
 *          schema:
 *            type: object
 *          description: object of query filters
 *          required: true
 *      responses:
 *        200:
 *          description: Fetched Successfully
 *        400:
 *          description: Bad Request
 *        404:
 *          description: Not Found
 *        500:
 *          description: Server Error
 *    post:
 *      tags: [Product]
 *      summary: Create product
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - quantityInStock
 *                - thumbnailUrl
 *              properties:
 *                name:
 *                  type: string
 *                quantityInStock:
 *                  type: number
 *                thumbnailUrl:
 *                  type: string
 */
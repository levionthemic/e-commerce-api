/**
 * CÁC BƯỚC TẠO ĐƠN HÀNG
 *
 * B1: Validate req.body. Dựa trên doc của API GHN để xác định các trường còn thiếu, cần thêm ở các Model có liên quan. Link doc: https://api.ghn.vn/home/docs/detail?id=112
 * B2: Tách đơn hàng theo shopId. Nghĩa là nếu 1 đơn hàng chứa các sản phẩm của n người bán, giả sử mỗi người bán có m đơn hàng thì sẽ tách thành n * m đơn hàng.
 * B3: Xóa các sản phẩm khỏi giỏ hàng
 * B4: Giảm stock và tăng sold của các sản phẩm tương ứng
 * B5: Gọi API tạo đơn hàng của GHN. Sau đó xử lý data trước khi thêm vào db. Link doc: https://api.ghn.vn/home/docs/detail?id=122
 */
const addOrder = (req, res, next) => {
  try {
    //
  } catch (error) { next(error) }
}

export const orderController = {
  addOrder
}


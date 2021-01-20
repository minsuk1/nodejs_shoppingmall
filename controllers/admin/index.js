const { Router } = require('express');
const router = Router();
const ctrl = require('./admin.ctrl');
const paginate = require('express-paginate');
const csrfProtection = require('../../middleware/csrf');

const upload = require('../../middleware/multer');
const adminRequired = require('../../helpers/adminRequired');


router.get('/products', paginate.middleware(3, 50), ctrl.get_products );

router.use( adminRequired );

router.get('/products/write', csrfProtection , ctrl.get_write );
router.post('/products/write' ,  upload.single('thumbnail'),  csrfProtection, ctrl.post_write);

router.get('/products/detail/:id' , ctrl.get_detail );
router.post('/products/detail/:id' , ctrl.post_detail);

router.get('/products/edit/:id' , csrfProtection , ctrl.get_edit ); 
router.post('/products/edit/:id', upload.single('thumbnail') , csrfProtection , ctrl.post_edit );
router.get('/products/delete/:id', ctrl.get_delete );

router.get('/products/delete/:product_id/:memo_id', ctrl.delete_memo );
router.post('/products/ajax_summernote', upload.single('thumbnail'), ctrl.ajax_summernote );

router.get('/order', ctrl.get_order );

router.get('/order/edit/:id', ctrl.get_order_edit );

router.get('/statistics', ctrl.statistics );

router.post('/order/edit/:id', ctrl.post_order_edit );

router.post('/tag', ctrl.write_tag);
router.delete('/tag/:product_id/:tag_id', ctrl.delete_tag);


module.exports = router;



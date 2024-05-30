"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart, removeFromCart, updateQuantity } from '../redux/reducer/cart-reducer';
import { createOrder } from '../redux/action/orders-action';
import { useUser } from '@auth0/nextjs-auth0/client';
import Rating from '@mui/material/Rating';
import closeCircle from "../../assets/close-icon.svg";
import emptyCartImage from "../../assets/empty-cart-img.png";
import placeholder from '../../assets/bolognese-spaghetti.jpeg';
import "./index.css";

export default function CartPage() {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.orders);
  const cart = useSelector(state => state.cart);
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const toggleModal = () => {
    setModalOpen(!modalOpen);
};

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item.id));
  };

  const handleDecrementQuantity = (itemId) => {
    dispatch(updateQuantity({ itemId, increment: false }));
  };

  const handleIncrementQuantity = (itemId) => {
    dispatch(updateQuantity({ itemId, increment: true }));
  };

  const handleClearToCart = () => {
    dispatch(clearCart());
  }

  const handleCheckout = () => {
    const orderItems = cart.items.map((item) => {
      return {
        foodId: item.id, quantity: item.quantity
      }
    })

    const order = {
      userId: user ? user.sid : null,
      restaurant: cart.restaurant,
      orderItems: orderItems
    }

    dispatch(createOrder(order));
  }

  const handleProcessedOrder = (status) => {
    if(status === 'succeeded'){
      setModalMessage("Order placed successfully");
    } else {
      setModalMessage("Failed to place Order, please try again");
    }
  }

  useEffect(() => {
    if (status !== 'idle' || 'loading') {
      handleProcessedOrder(status);
    }
  }, [status]);


  if (cart.items?.length < 1) {
    return (
      <div className='empty-cart-container'>
        <div className='empty-cart-image'>
          <Image priority={true} src={emptyCartImage} alt="Empty Cart" />
        </div>
        <div className='empty-cart-description'>
          <div className='empty-cart-image-subtext'>Good Food is always cooking</div>
          <p className='empty-cart-message'>Your Cart is Empty. Add something from the menu</p>
          <Link href="/menu" className='empty-cart-menu-link'>
            <p>Browse Menu</p>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='cart-container'>
        <div className='cart-title'>
          <p>Cart</p>
        </div>
        <div className='cart-items'>
          {cart.items?.length > 0 ? (
            <div className='cart-card table-titles'>
              <div className='cart-card-name'>Name</div>
              <div className='cart-card-price'>Price</div>
              <div className='cart-quantity-action-wrapper'>
                <div className='cart-card-quantity'>Quantity</div>
              </div>
              <div className='cart-remove-btn'>
                <div>Total</div>
              </div>
            </div>) : (<></>)}
          {cart.items?.map(item => (
            <div className='cart-card' key={item.id}>
              <div className='cart-card-name'>
                <div className='cart-card-name-image-container'>
                  <div className='cart-card-name-image'>
                    <Image priority={true} src={placeholder} alt='Product Image' />
                  </div>
                  <div className='cart-card-name-capsule'>
                    <div>{item.foodName}</div>
                    <div className='cart-card-category'>{item.category[0]}</div>
                    <div className="cart-rating-container">
                      <div>{item.rating}</div>
                      <Rating name="read-only" precision={0.5} value={parseInt(item.rating)} readOnly size="small" />
                    </div>
                  </div>
                </div>
              </div>
              <div className='cart-card-price'>${item.price}</div>
              <div className='cart-quantity-action-wrapper'>
                <div className='cart-quantity-action'>
                  <button className='cart-decrement-btn' onClick={() => handleDecrementQuantity(item.id)}>-</button>
                  <div className='cart-card-quantity'>{item.quantity}</div>
                  <button className='cart-increment-btn' onClick={() => handleIncrementQuantity(item.id)}>+</button>
                </div>
              </div>
              <div className='total-action-wrapper'>
                <div className='cart-card-total'>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button className='cart-remove-btn' onClick={() => handleRemoveFromCart(item)}>
                  <Image src={closeCircle} alt="close button" width={18} height={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className='cart-actions'>
          <div className='cart-total-price-wrapper'>
            <p>Sub Total:</p>
            <p className='cart-total-price'>${cart.total?.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]}</p>
          </div>
          <div className='cart-restaurant-wrapper'>
            <p>Restaurant:</p>
            <p className='cart-restaurant'> {cart.items?.length > 0 ? cart.restaurant : ""}</p>
          </div>
          <div className='cart-buttons'>
            <button className='clear-cart' onClick={handleCheckout}>
              Checkout
            </button>
            <button className='clear-cart' onClick={handleClearToCart}>
              Clear Cart
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={toggleModal}
        className="user-options-modal"
        overlayClassName="user-options-overlay"
        ariaHideApp={false}
      >
        <div className="user-options-close-btn-wrapper">
          <div></div>
          <button className="user-options-close-btn" onClick={toggleModal} />
        </div>
      </Modal>
    </>
  );
};
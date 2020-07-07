import { useEffect, useState } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const STRIPE_PUB_KEY =
  'pk_test_51H0Cq9E0D7FXS4yi0a4YO9dg7pDN3CUvOw6cvwaJfSW4qZ7ybpuCbGRO1liveCpghxHn8Mz7vk5rAFCkjN3moRZI00MN0cIhal';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/v1/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: (payment) => Router.push('/orders')
  });

  useEffect(() => {
    const calcTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / (1000 * 60)));
    };
    calcTimeLeft();
    const timerId = setInterval(calcTimeLeft, 1000 * 60);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      {timeLeft} minutes until order expires
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={STRIPE_PUB_KEY}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/v1/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;

const fakeChargeId = 'someid';

class Stripe {
  charges = {
    create: jest.fn().mockResolvedValue({
      id: fakeChargeId
    })
  };
};
const stripe = jest.fn(() => new Stripe());

export default Stripe;
export { stripe, fakeChargeId };
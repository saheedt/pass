import buildClient from '../api/build-client';

const landingPage = ({ currentUser }) => {
  console.log('current user: ', currentUser);
  return <h1>Welcome home!!!</h1>;
};

landingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/v1/users/currentuser');
  
  return data;
};

export default landingPage;


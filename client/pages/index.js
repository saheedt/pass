import buildClient from '../api/build-client';

const landingPage = ({ currentUser }) => {

  return (
    <h1>{ currentUser ?
      'You are signed in' : 'You are NOT signed in'}
    </h1>
  );
};

landingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/v1/users/currentuser');
  
  return data;
};

export default landingPage;


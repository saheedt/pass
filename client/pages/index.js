const landingPage = ({ currentUser }) => {

  return (
    <h1>{ currentUser ?
      'You are signed in' : 'You are NOT signed in'}
    </h1>
  );
};

landingPage.getInitialProps = async (context, client, currentUser) => {
  return {};
};

export default landingPage;


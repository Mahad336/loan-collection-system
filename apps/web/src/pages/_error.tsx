import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ padding: 50, textAlign: 'center' }}>
      <h1>{statusCode ? `Error ${statusCode}` : 'An error occurred'}</h1>
      <p>
        {statusCode === 404
          ? 'The page you are looking for does not exist.'
          : 'Something went wrong.'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? (err as { statusCode?: number })?.statusCode ?? 404;
  return { statusCode };
};

export default Error;

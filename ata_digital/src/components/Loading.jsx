const Loading = ({ message = "Carregando..." }) => {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }} />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
interface PluralProps {
    value: number;
    one: string;
    other: string;
  }
  
  const Plural: React.FC<PluralProps> = ({ value, one, other }) => {
    return <>{value === 1 ? one.replace('#', value.toString()) : other.replace('#', value.toString())}</>;
  };
  
  export default Plural;
  
import React, { useMemo } from 'react';
import { cn } from 'src/misc/cn';
import { useDebounce } from 'src/misc/utils';

const SuggestionTags: React.FC<{
  loading: boolean;
  listOfSuggestions: {
    fromToken: JSX.Element[];
    toToken: JSX.Element[];
    additional: JSX.Element[];
  };
}> = ({ loading, listOfSuggestions }) => {
  const debouncedLoading = useDebounce(loading, 100);

  const shouldRender = useMemo(() => {
    return (
      [listOfSuggestions.additional, listOfSuggestions.fromToken, listOfSuggestions.toToken].flat().filter(Boolean)
        .length > 0
    );
  }, [listOfSuggestions]);

  return (
    <>
      <div className={cn('transition-all duration-200', shouldRender ? 'opacity-100 !h-auto' : 'opacity-0 !h-0')}>
        <div
          className={cn(
            'pt-2 relative flex flex-wrap gap-y-1 gap-x-2 transition-all',
            debouncedLoading ? 'blur-xs opacity-50 pointer-events-none' : 'opacity-100',
          )}
        >
          {listOfSuggestions.additional}
          {listOfSuggestions.fromToken}
          {listOfSuggestions.toToken}
        </div>
      </div>
    </>
  );
};

export default SuggestionTags;

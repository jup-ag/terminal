export const Upsell = () => {
  return (
    <div className="text-white grid  md:grid-cols-2 gap-4 px-2 mt-4 max-w-[700px] mx-auto">
      <div className="bg-[#182220] rounded-xl p-4 relative h-[160px] flex flex-col gap-y-2 ">
        <div className="text-xl font-semibold">Swap fees</div>
        <div className="text-white/60 text-sm">Earn swap fees easily.</div>

        <img src="/upsell/swap_fee.svg" alt="swap-fees" className="absolute top-0 right-0" />
      </div>
      <div className="bg-[#151E31] rounded-xl p-4 relative gap-y-2 flex flex-col h-[160px]">
        <div className="text-xl font-semibold w-[80%]">Customizable Options</div>
        <div className="text-white/60 w-[80%] text-sm">
          Multiple display options and other configurations to match your application&apos;s needs.
        </div>

        <img src="/upsell/customizable_options.svg" alt="swap-fees" className="absolute top-0 right-0" />
      </div>
      <div className="bg-[#002F25] rounded-xl p-4 relative h-[160px] flex flex-col gap-y-2">
        <div className="text-xl font-semibold w-[80%]">Ultra Swap</div>
        <div className="text-white/60 w-[80%] text-sm">
          Seamlessly integrate end to end jup.ag swap experience with all Ultra features
        </div>
        <img src="/upsell/seemless_integration.svg" alt="swap-fees" className="absolute top-0 right-0" />
      </div>
      <div className="bg-[#231B32] rounded-xl p-4 relative h-[160px] flex flex-col gap-y-2">
        <div className="text-xl font-semibold w-[80%]">RPC-less</div>
        <div className="text-white/60 w-[80%] text-sm">
          All the Ultra goodness without any RPCs - we handle everything for you, including transaction sending
        </div>
        <img src="/upsell/rpc_less.svg" alt="swap-fees" className="absolute top-0 right-0" />
      </div>
    </div>
  );
};

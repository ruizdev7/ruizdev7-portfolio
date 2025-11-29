/**
 * Blockchain Visualization
 * Minimalist chain of blocks
 */

import { LinkIcon } from "@heroicons/react/24/outline";

const BlockchainVisualization = ({ blocks = [] }) => {
  const displayBlocks = blocks.slice(0, 15).reverse();

  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg">
        <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
          No hay bloques en la cadena
        </p>
      </div>
    );
  }

  return (
    <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6">
      <div className="mb-6">
        <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
          {blocks.length} bloques
        </p>
      </div>
      <div className="space-y-2">
        {displayBlocks.map((block, idx) => (
          <div
            key={block.block_hash || idx}
            className="flex items-center gap-3 p-2 border-b border-do_border_light dark:border-gray-700 last:border-0"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-do_border_light dark:border-gray-700 rounded">
              <span className="text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                {block.block_number || idx + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-do_text_light dark:text-do_text_dark truncate">
                {block.event_type || "Transaction"}
              </p>
            </div>
            {block.blockchain_tx_hash && (
              <div className="flex-shrink-0 flex items-center gap-1">
                <LinkIcon className="h-3 w-3 text-do_text_gray_light dark:text-do_text_gray_dark" />
                <span className="text-xs font-mono text-do_text_gray_light dark:text-do_text_gray_dark">
                  {block.blockchain_tx_hash.substring(0, 6)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainVisualization;

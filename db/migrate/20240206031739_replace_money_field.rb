class ReplaceMoneyField < ActiveRecord::Migration[7.2]
  def change
    add_monetize :accounts, :balance
    change_column :accounts, :balance_cents, :integer, limit: 8

    Account.reset_column_information

    Account.find_each do |account|
      account.update_columns(balance_cents: Money.from_amount(account.balance, account.currency).cents)
    end

    remove_column :accounts, :balance
  end
end

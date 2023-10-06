export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
  account
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} </div>
        </li>
        {parseFloat(value) > 0 ? <div
          className="button"
          id={address}
          onClick={(e) => {
            e.preventDefault();
            if (account.toLowerCase() != arbiter.toLowerCase()) {
              alert("No arbiter!");
            } else {
              handleApprove();
            }
          }}
        >
          Approve
        </div>
          : <div className="complete">✓ It's been approved!</div>
        }
      </ul>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="page">
      <div className="container">
        <div className="link-list">
          <LinkItem text="程式一" link="/example" />
          <LinkItem text="文字編輯器" link="/TextEditor" />
        </div>
      </div>
    </div>
  );
}

function LinkItem({ text = "文字", link = "#" }) {
  return (
    <Link className="link-item" href={link}>
      <div className="img-box"></div>
      <div className="text-box">
        <p>{text}</p>
      </div>
    </Link>
  );
}

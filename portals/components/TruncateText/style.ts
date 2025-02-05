import { makeStyles } from "@mui/styles";

interface StyleProps {
  width: string;
}

const useStyle = makeStyles(() => ({
  textTruncate: (props: StyleProps) => ({
    display: "block",
    overflow: "hidden",
    width: props.width,
    "& span, p, h1, h2, h3, h4, h5, h6": {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
    },
  }),
}));

export default useStyle;

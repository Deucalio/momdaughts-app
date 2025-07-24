// app/api/users+api.ts
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export async function GET(request) {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-Shopify-Access-Token", ACCESS_TOKEN);

    const graphql = JSON.stringify({
      query:
        "{\r\n      products(first: 5) {\r\n        edges {\r\n          node {\r\n            id\r\n            title\r\n            handle\r\n            description\r\n            images(first: 5) {\r\n              edges {\r\n                node {\r\n                  id\r\n                  altText\r\n                  originalSrc\r\n                }\r\n              }\r\n            }\r\n            variants(first: 3) {\r\n              edges {\r\n                node {\r\n                  id\r\n                  title\r\n                  price\r\n                }\r\n              }\r\n            }\r\n          }\r\n        }\r\n      }\r\n    }\r\n  ",
      variables: {},
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
      redirect: "follow",
    };

    // fetch(
    //   "https://momdaughts.myshopify.com/admin/api/2024-04/graphql.json",
    //   requestOptions
    // )
    //   .then((response) => response.text())
    //   .then((result) => console.log(result))
    //   .catch((error) => console.error(error));

    const response = await fetch(
      `https://momdaughts.myshopify.com/admin/api/2024-04/graphql.json`,
      requestOptions
    );

    // Check if response is OK
    if (!response.ok) {
      console.log("hqhq", response);
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Extract products data from response
    // const products = data.data.products.edges.map((edge) => edge.node);

    const products = data.data.products.edges.map((edge) => {
      const product = edge.node;

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        images: product.images.edges.map((imageEdge) => ({
          id: imageEdge.node.id,
          altText: imageEdge.node.altText,
          originalSrc: imageEdge.node.originalSrc,
        })),
        variants: product.variants.edges.map((variantEdge) => ({
          id: variantEdge.node.id,
          title: variantEdge.node.title,
          price: variantEdge.node.price,
        })),
      };
    });

    // Return the products
    return Response.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);

    // Return error message
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validate input
    if (!name || !email) {
      return Response.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Create user in database
    const newUser = {
      id: Date.now(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    return Response.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}

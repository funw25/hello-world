#include<stdio.h>
int main()
{
	char c;
	scanf("%c",&c);
	
	switch(c)
	{
		case' ':printf("%c is a space.",c);break;
		case'0':printf("%c is a number.",c);break;
		case'1':printf("%c is a number.",c);break;
		case'2':printf("%c is a number.",c);break;
		case'3':printf("%c is a number.",c);break;
		case'4':printf("%c is a number.",c);break;
		case'5':printf("%c is a number.",c);break;
		case'6':printf("%c is a number.",c);break;
		case'7':printf("%c is a number.",c);break;
		case'8':printf("%c is a number.",c);break;
		case'9':printf("%c is a number.",c);break;
		default:printf("%c is not a space or a number.",c);break;
	}
	return 0;
}

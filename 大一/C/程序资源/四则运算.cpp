#include<stdio.h>
int main()
{
    float x,y,z;
    char ch;
    scanf("%f%c%f",&x,&ch,&y);
    switch(ch)
    {
        case '+':z=x+y;break;
        case '-':z=x-y;break;
        case '*':z=x*y;break;
        case '/':z=x/y;break;
        default:printf("Unknown operator");break;
    }
    printf("%.2f",z);
    return 0;
}

#include <stdio.h>

int main() {
    char *p = "China";
    int i;
    for (i = 0; i < 5; i++) {
        printf("%c\n", *(p + i));
    }
    return 0;
}
